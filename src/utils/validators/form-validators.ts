export const requiredField = (value: string | number): string | null => {
  const message = 'This field is required';

  switch (typeof value) {
    case 'string':
      return value?.length ? null : message;
    case 'number':
      return null;
    default:
      return value ? null : message;
  }
}