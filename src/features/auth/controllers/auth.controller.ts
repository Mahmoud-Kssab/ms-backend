import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

interface CookieResponse {
  cookie: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: 'lax';
      secure: boolean;
      maxAge: number;
    },
  ) => void;
  clearCookie: (name: string) => void;
}

interface CookieRequest {
  headers: {
    cookie?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: CookieResponse,
  ) {
    const session = await this.authService.register(registerDto);
    this.setAuthCookies(res, session.accessToken, session.refreshToken);
    return session.user;
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: CookieResponse,
  ) {
    const session = await this.authService.login(loginDto);
    this.setAuthCookies(res, session.accessToken, session.refreshToken);
    return session.user;
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: CookieRequest,
    @Res({ passthrough: true }) res: CookieResponse,
  ) {
    const refreshToken = this.getCookie(req.headers.cookie, 'refresh_token');
    const payload = this.tokenService.verifyToken(refreshToken ?? '', 'refresh');
    const session = await this.authService.refresh(payload.sub);
    this.setAuthCookies(res, session.accessToken, session.refreshToken);
    return session.user;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: CookieResponse) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Req() req: CookieRequest & { user: AuthenticatedUser }) {
    return this.authService.getCurrentUser(req.user.id);
  }

  private setAuthCookies(
    res: CookieResponse,
    accessToken: string,
    refreshToken: string,
  ) {
    const secure = process.env.COOKIE_SECURE === 'true';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private getCookie(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
      return undefined;
    }

    const cookie = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : undefined;
  }
}
