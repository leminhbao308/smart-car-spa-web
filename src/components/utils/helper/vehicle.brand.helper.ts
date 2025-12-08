/**
 *
 * @param foundedYear - Năm thành lập của hãng xe
 * @returns Tuổi của hãng xe
 */
const calculateBrandAge = (foundedYear: number) => {
  const currentYear = new Date().getFullYear();
  return currentYear - foundedYear;
};

export { calculateBrandAge };
