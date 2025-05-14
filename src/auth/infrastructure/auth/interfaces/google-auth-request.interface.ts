import { Request } from 'express';
import { GoogleUser } from '../interfaces/google-user.interface';

export interface GoogleAuthRequest extends Request {
  user: GoogleUser;
}
