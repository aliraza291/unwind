import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    // If there is an error or no user, return null instead of throwing Unauthorized
    if (err || !user) {
      return null;
    }
    return user; // If the token is valid, return the user
  }
}
