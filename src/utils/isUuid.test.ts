import isUuid from './isUuid';

describe('isUuid', () => {
  it('should accept UUIDs in canonical form, in either case', () => {
    expect(isUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    expect(isUuid('F47AC10B-58CC-4372-A567-0E02B2C3D479')).toBe(true);
    expect(isUuid('00000000-0000-0000-0000-000000000000')).toBe(true);
    expect(isUuid('ffffffff-FFFF-aaaa-AAAA-999999999999')).toBe(true);
  });

  it('should reject anything else', () => {
    // Wrong length
    expect(isUuid('f47ac10b-58cc-4372-a567-0e02b2c3d47')).toBe(false);
    expect(isUuid('user-id')).toBe(false);
    // A character outside 0-9, a-f and A-F
    expect(isUuid('g47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(false);
    expect(isUuid('G47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(false);
    expect(isUuid('@47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(false);
    expect(isUuid('`47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(false);
    // A hyphen out of place, or missing
    expect(isUuid('f47ac10b558cc-4372-a567-0e02b2c3d479')).toBe(false);
    expect(isUuid('f47ac10b-58cc-4372-a567-0e02b2c3d4-9')).toBe(false);
    expect(isUuid('f47ac10b_58cc_4372_a567_0e02b2c3d479')).toBe(false);
  });
});
