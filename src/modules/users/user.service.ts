import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TherapistEmployment } from './entities/therapistEmployement.entity';
import { TherapistProfileCompletionDto } from './dto/profile-complition.dto';
import { Therapist } from './entities/therapist.entity';
import { TherapistQualification } from './entities/therapistQualification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Therapist)
    private therapistRepository: Repository<Therapist>,
    @InjectRepository(TherapistEmployment)
    private therapistEmploymentRepository: Repository<TherapistEmployment>,
    @InjectRepository(TherapistQualification)
    private therapistQualificationRepository: Repository<TherapistQualification>,
  ) {}

  async completeTherapistProfile(
    userId: string,
    data: TherapistProfileCompletionDto,
  ) {
    // Find the therapist
    const therapist = await this.therapistRepository.findOne({
      where: { id: userId },
      relations: ['qualifications', 'employmentHistory'],
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    // Update basic profile information if provided
    let updatedBasicInfo = false;
    if (
      data.title ||
      data.expertise ||
      data.cnic ||
      data.careerJourney ||
      data.profileImage
    ) {
      if (data.title) therapist.title = data.title;
      if (data.expertise) therapist.expertise = data.expertise;
      if (data.cnic) therapist.cnic = data.cnic;
      if (data.careerJourney) therapist.careerJourney = data.careerJourney;
      if (data.profileImage) therapist.profileImage = data.profileImage;
      updatedBasicInfo = true;

      // Check if basic info is complete
      const isBasicInfoComplete =
        therapist.title && therapist.expertise && therapist.cnic;
      if (
        isBasicInfoComplete &&
        therapist.profileCompletionStep === 'personal-info'
      ) {
        therapist.profileCompletionStep = 'qualifications';
      }
    }

    // Handle qualifications if provided
    let updatedQualifications = false;
    if (data.qualifications && data.qualifications.length > 0) {
      // Remove existing qualifications if any
      if (therapist.qualifications?.length) {
        await this.therapistQualificationRepository.remove(
          therapist.qualifications,
        );
      }

      // Create new qualification entities
      const qualifications = data.qualifications.map((qual) => {
        const qualification = new TherapistQualification();
        qualification.degreeTitle = qual.degreeTitle;
        qualification.completionYear = qual.completionYear;
        qualification.cgpa = qual.cgpa;
        qualification.city = qual.city;
        qualification.institute = qual.institute;
        qualification.specialization = qual.specialization;
        qualification.therapist = therapist;
        return qualification;
      });

      // Save qualifications
      await this.therapistQualificationRepository.save(qualifications);
      updatedQualifications = true;

      // Update step if moving from qualifications to employment
      if (therapist.profileCompletionStep === 'qualifications') {
        therapist.profileCompletionStep = 'employment';
      }
    }

    // Handle employment history if provided
    let updatedEmployment = false;
    if (data.employmentHistory && data.employmentHistory.length > 0) {
      // Remove existing employment records if any
      if (therapist.employmentHistory?.length) {
        await this.therapistEmploymentRepository.remove(
          therapist.employmentHistory,
        );
      }

      // Create new employment entities
      const employmentHistory = data.employmentHistory.map((emp) => {
        const employment = new TherapistEmployment();
        employment.jobTitle = emp.jobTitle;
        employment.employer = emp.employer;
        employment.startDate = new Date(emp.startDate);
        employment.endDate = emp.endDate ? new Date(emp.endDate) : null;
        employment.therapist = therapist;
        return employment;
      });

      // Save employment history
      await this.therapistEmploymentRepository.save(employmentHistory);
      updatedEmployment = true;

      // Update step if employment is the last step
      if (therapist.profileCompletionStep === 'employment') {
        therapist.profileCompletionStep = 'complete';
        therapist.isProfileComplete = true;
      }
    }

    // Check overall profile completion status
    const hasBasicInfo =
      therapist.title && therapist.expertise && therapist.cnic;

    // Query for the latest data to make accurate checks
    const qualificationCount =
      await this.therapistQualificationRepository.count({
        where: { therapist: { id: therapist.id } },
      });

    const employmentCount = await this.therapistEmploymentRepository.count({
      where: { therapist: { id: therapist.id } },
    });

    const hasQualifications = qualificationCount > 0;
    const hasEmployment = employmentCount > 0;

    // Set complete status if all sections are done
    if (hasBasicInfo && hasQualifications && hasEmployment) {
      therapist.profileCompletionStep = 'complete';
      therapist.isProfileComplete = true;
    }

    // Save therapist with updated status
    await this.therapistRepository.save(therapist);

    // Return info about what was updated and current step
    return {
      message: 'Profile updated successfully',
      therapistId: therapist.id,
      profileCompletionStep: therapist.profileCompletionStep,
      isProfileComplete: therapist.isProfileComplete,
      updatedSections: {
        basicInfo: updatedBasicInfo,
        qualifications: updatedQualifications,
        employmentHistory: updatedEmployment,
      },
      completedSections: {
        basicInfo: hasBasicInfo,
        qualifications: hasQualifications,
        employmentHistory: hasEmployment,
      },
    };
  }
}
