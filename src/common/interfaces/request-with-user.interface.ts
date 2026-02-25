import { RequestedUser } from './requested-user.interface';

export interface RequestWithUser extends Request {
  user: RequestedUser;
}
