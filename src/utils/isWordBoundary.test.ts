import isWordBoundary from './isWordBoundary';

describe('isWordBoundary', () => {
  it('should start a word at an uppercase letter after a lowercase letter or digit', () => {
    expect(isWordBoundary('fooBar', 3)).toBe(true);
    expect(isWordBoundary('foo1Bar', 4)).toBe(true);
  });

  it('should start a word at the last letter of an acronym followed by lowercase', () => {
    expect(isWordBoundary('HTTPResponse', 4)).toBe(true);
    expect(isWordBoundary('getHTTPResponse', 7)).toBe(true);
  });

  it('should start a word after a one-letter word', () => {
    expect(isWordBoundary('XAxis', 1)).toBe(true);
    expect(isWordBoundary('OAuth', 1)).toBe(true);
    expect(isWordBoundary('isAValidUser', 3)).toBe(true);
    expect(isWordBoundary('threeDSecure', 6)).toBe(true);
    expect(isWordBoundary('html5AVideo', 6)).toBe(true);
  });

  it('should not split an acronym', () => {
    expect(isWordBoundary('HTTPResponse', 1)).toBe(false);
    expect(isWordBoundary('HTTPResponse', 3)).toBe(false);
    expect(isWordBoundary('userID', 5)).toBe(false);
    expect(isWordBoundary('iOSVersion', 2)).toBe(false);
  });

  it('should keep a plural s with its acronym', () => {
    expect(isWordBoundary('URLs', 2)).toBe(false);
    expect(isWordBoundary('IDs', 1)).toBe(false);
    expect(isWordBoundary('IDsList', 1)).toBe(false);
    expect(isWordBoundary('allowedURLs', 9)).toBe(false);
    expect(isWordBoundary('userIDs', 5)).toBe(false);
    expect(isWordBoundary('getURLsForIDs', 5)).toBe(false);
    expect(isWordBoundary('getURLsForIDs', 7)).toBe(true);
    expect(isWordBoundary('GPUs2', 2)).toBe(false);
  });

  it('should treat only a lone lowercase s as a plural', () => {
    // An uppercase S starts a new word
    expect(isWordBoundary('HTTPServer', 4)).toBe(true);
    // An s followed by more lowercase letters is not a plural, so the word starts at
    // the capital before it
    expect(isWordBoundary('URLsafe', 2)).toBe(true);
    expect(isWordBoundary('IDsort', 1)).toBe(true);
  });

  it('should return false for lowercase letters, digits and the first character', () => {
    expect(isWordBoundary('fooBar', 1)).toBe(false);
    expect(isWordBoundary('foo1', 3)).toBe(false);
    expect(isWordBoundary('FooBar', 0)).toBe(false);
  });

  it('should return false outside the string', () => {
    expect(isWordBoundary('fooBar', 6)).toBe(false);
    expect(isWordBoundary('', 0)).toBe(false);
  });
});
