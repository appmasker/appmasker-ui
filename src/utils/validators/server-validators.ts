export const goModuleValidator = (modulePath: string): string | null => {
  if (!modulePath) {
    return 'This field is required';
  }
  const regex = /^(?!http).+[\w\d]+\.[\S]+\/[\S]+\/[\S]+/i;
  return regex.test(modulePath) ? null : 'This is not a valid Go Module path';
}