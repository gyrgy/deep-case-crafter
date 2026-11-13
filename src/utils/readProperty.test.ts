import readProperty from './readProperty';

describe('readProperty', () => {
  it('should read a value, through its getter for an accessor', () => {
    const object = {
      user_id: 1,
      get user_name() {
        return 'Ann';
      },
    };
    expect(readProperty(object, 'user_id')).toBe(1);
    expect(readProperty(object, 'user_name')).toBe('Ann');
  });
});
