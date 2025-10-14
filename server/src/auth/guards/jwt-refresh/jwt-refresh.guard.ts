import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { jwtRefreshKey } from '../../common/constants';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(jwtRefreshKey) {}
