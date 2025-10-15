import { JwtRefreshGuard } from './jwt-refresh.guard';

describe('JwtRefreshGuard', () => {
  it('should be defined', () => {
    expect(new JwtRefreshGuard()).toBeDefined();
  });

  it('can be instantiated and is an Auth guard', () => {
    const guard = new JwtRefreshGuard();
    expect(guard).toBeInstanceOf(JwtRefreshGuard);
  });
});
