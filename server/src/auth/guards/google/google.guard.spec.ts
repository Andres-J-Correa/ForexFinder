import { GoogleGuard } from './google.guard';

describe('GoogleGuard', () => {
  it('should be defined', () => {
    expect(new GoogleGuard()).toBeDefined();
  });

  it('is an Auth guard that can be instantiated without reflector', () => {
    const guard = new GoogleGuard();
    expect(guard).toBeInstanceOf(GoogleGuard);
  });
});
