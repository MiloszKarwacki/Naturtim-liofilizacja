import prisma from "@/lib/prisma";

export async function generateBatchNumber() {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString();
  const suffix = `/${month}/${year}`;

  // Wyszukujemy wszystkie partie z numerami kończącymi się na aktualny miesiąc i rok
  const batches = await prisma.productionBatch.findMany({
    where: {
      batchNumber: { endsWith: suffix }
    }
  });

  let newNumber = 1;
  if (batches.length > 0) {
    let maxNumber = 0;
    batches.forEach(batch => {
      // Rozbijamy numer partii na części – oczekujemy formatu "XX/MONTH/YEAR"
      const parts = batch.batchNumber.split("/");
      const numberPart = parseInt(parts[0]);
      if (!isNaN(numberPart) && numberPart > maxNumber) {
        maxNumber = numberPart;
      }
    });
    newNumber = maxNumber + 1;
  }

  const newNumberPadded = newNumber.toString().padStart(2, "0");
  return `${newNumberPadded}/${month}/${year}`;
}