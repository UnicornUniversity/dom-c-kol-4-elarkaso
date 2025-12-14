const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
//TODO doc
/**
 * The main function which calls the application. 
 * Please, add specific description here for the application purpose.
 * @param {object} dtoIn contains count of employees, age limit of employees {min, max}
 * @returns {object} containing the statistics
 */
export function main(dtoIn) {
  getEmployeeStatistics(generateEmployeeData(dtoIn));
  
}
// původní main převedený na funkci
  function generateEmployeeData(dtoIn) {
    // pole náhodných českých jmen mužů
    const maleNames = [
      "Jan", "Petr", "Josef", "Tomáš", "Martin", "Jiří", "Ondřej", "David", "Lukáš",
      "Jakub", "Michal", "Marek", "Filip", "Václav", "Daniel", "Matěj", "Radek",
      "Roman", "Karel"
    ];

    // pole náhodných českých příjmení mužů
    const maleSurnames = [
      "Novák", "Svoboda", "Novotný", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý",
      "Horák", "Němec", "Pokorný", "Fiala", "Sedláček", "Jelínek", "Růžička", "Malý",
      "Král", "Beneš", "Holub"
    ];

    // pole náhodných českých jmen žen
    const femaleNames = [
      "Jana", "Marie", "Eva", "Anna", "Lucie", "Tereza", "Adéla", "Veronika", "Barbora",
      "Monika", "Zuzana", "Petra", "Kristýna", "Nikola", "Markéta", "Kamila", "Blanka",
      "Michaela", "Ludmila", "Alžběta", "Viktorie", "Nela", "Sára"
    ];

    // pole náhodných českých příjmení žen
    const femaleSurnames = [
      "Nováková", "Svobodová", "Dvořáková", "Černá", "Procházková",
      "Kučerová", "Veselá", "Horáková", "Němcová", "Pokorná",
      "Pospíšilová", "Hájeková", "Králová", "Jelínková", "Růžičková"
    ];

    // možné úvazky (lepší mít mimo cyklus)
    const workloads = [10, 20, 30, 40];

    // výstup
    const employees = [];

    // načtení věkového intervalu
    const minAge = dtoIn.age.min;
    const maxAge = dtoIn.age.max;

    // kontrola duplicitních dat narození
    const usedBirthdates = new Set();

    for (let x = 0; x < dtoIn.count; x++) {
      // 1) gender
      const gender = Math.random() < 0.5 ? "male" : "female";

      // 2) birthdate v intervalu <minAge, maxAge) a unikátní
      let birthdate;
      do {
        const age = minAge + Math.random() * (maxAge - minAge);
        const birthMs = Date.now() - age * YEAR_MS;
        birthdate = new Date(birthMs).toISOString();
      } while (usedBirthdates.has(birthdate));
      usedBirthdates.add(birthdate);

      // 3) jméno + příjmení podle genderu
      let firstName;
      let lastName;

      if (gender === "male") {
        firstName = maleNames[Math.floor(Math.random() * maleNames.length)];
        lastName = maleSurnames[Math.floor(Math.random() * maleSurnames.length)];
      } else {
        firstName = femaleNames[Math.floor(Math.random() * femaleNames.length)];
        lastName = femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)];
      }

      // 4) workload
      const workload = workloads[Math.floor(Math.random() * workloads.length)];

      // 5) složení objektu zaměstnance
      employees.push({
        gender: gender,
        birthdate: birthdate,
        name: firstName,
        surname: lastName,
        workload: workload
      });
    }

    return employees;
  }

  // funkce pro výpočet statistik
  function getEmployeeStatistics(employees) {

    // pomocná funkce: ISO date -> věk v letech (desetinné)
    function getAgeFromBirthdate(isoBirthdate) {
      const birthMs = Date.parse(isoBirthdate);
      return (Date.now() - birthMs) / YEAR_MS;
    }

    // pomocná funkce: medián číselného pole
    function median(values) {
      const sorted = values.slice().sort((a, b) => a - b);
      const n = sorted.length;
      const mid = Math.floor(n / 2);
      return n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    // 1) počet zaměstnanců
    const employeeCount = employees.length;

    // 2) počty podle workload
    const employeeCountByWorkload = { 10: 0, 20: 0, 30: 0, 40: 0 };

    // 3) pole věků a workloadů (pro průměry/median)
    const ages = [];
    const workloads = [];

    // 4) pro průměr workload žen
    let femaleWorkloadSum = 0;
    let femaleCount = 0;

    for (const e of employees) {
      // workload counts
      employeeCountByWorkload[e.workload]++;

      // ages + workloads list
      const age = getAgeFromBirthdate(e.birthdate);
      ages.push(age);
      workloads.push(e.workload);

      // female avg workload
      if (e.gender === "female") {
        femaleWorkloadSum += e.workload;
        femaleCount++;
      }
    }

    // 5) průměrný věk (1 desetinné místo)
    const averageAgeRaw = ages.reduce((sum, a) => sum + a, 0) / ages.length;
    const averageAge = Math.round(averageAgeRaw * 10) / 10;
    averageAge.toFixed(1); //zaokrouhlit na 1 desetinne misto

    // 6) min/max věk
    const minAgeUnfloored = Math.min(...ages); // nejmladší
    const minAge = Math.floor(minAgeUnfloored);
    const maxAgeUnfloored = Math.max(...ages); // nejstarší
    const maxAge = Math.floor(maxAgeUnfloored);

    // 7) medián věku
    const medianAge = median(ages);

    // 8) medián workloadu
    const medianWorkload = median(workloads);

    // 9) průměrný workload u žen
    const averageWomenWorkload =
      femaleCount === 0 ? 0 : Math.round((femaleWorkloadSum / femaleCount) * 10) / 10;

    // 10) seznam zaměstnanců seřazených podle workload (vzestupně)
    const employeesSortedByWorkload = employees.slice().sort((a, b) => a.workload - b.workload);

    // výsledný dtoOut objekt se statistikami
    return {
      employeeCount,
      employeeCountByWorkload,
      averageAge,
      minAge,
      maxAge,
      medianAge,
      medianWorkload,
      averageWomenWorkload,
      employeesSortedByWorkload
    };
	}