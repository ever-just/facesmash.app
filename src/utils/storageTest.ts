export function testStorageSetup() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    console.log('Storage test: localStorage is available');
    return true;
  } catch (e) {
    console.warn('Storage test: localStorage is NOT available', e);
    return false;
  }
}
