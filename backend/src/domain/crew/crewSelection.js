// crewSelection.js

/**
 * @typedef {Object} Pilot
 * @property {string} pilotId
 * @property {string} name
 * @property {string} vehicleType   // e.g. "A320"
 * @property {number} maxDistanceKm
 * @property {"senior"|"junior"|"trainee"} seniority
 */

/**
 * @typedef {Object} Attendant
 * @property {string} attendantId
 * @property {string} name
 * @property {string[]} vehicleTypes   // allowed aircraft types
 * @property {boolean} isChief
 * @property {boolean} isJunior
 * @property {boolean} isChef
 * @property {string[]} recipes        // only for chefs; can be []
 */

/**
 * @typedef {Object} FlightContext
 * @property {string} flightId
 * @property {string} vehicleType
 * @property {number} distanceKm
 */

/**
 * @typedef {"info"|"warning"|"error"} Severity
 */

/**
 * @typedef {Object} ValidationWarning
 * @property {string} code
 * @property {string} message
 * @property {Severity} severity
 * @property {Object} [refs]
 */

/**
 * @typedef {Object} CrewSelectionResult
 * @property {Pilot[]} pilots
 * @property {Attendant[]} cabin
 * @property {ValidationWarning[]} warnings
 * @property {string[]} selectedRecipes
 */

const defaultPilotRules = {
  minTotal: 2,
  maxTotal: 4,
  minSenior: 1,
  minJunior: 1,
  maxTrainee: 2
};

const defaultCabinRules = {
  minChiefs: 1,
  maxChiefs: 4,
  minJuniors: 4,
  maxJuniors: 16,
  minChefs: 0,
  maxChefs: 2
};

function warn(code, message, severity = "warning", refs = {}) {
  return { code, message, severity, refs };
}

/**
 * Main entry point.
 *
 * @param {FlightContext} flight
 * @param {Pilot[]} pilotPool
 * @param {Attendant[]} cabinPool
 * @param {Object} [rulesOverride]
 * @returns {CrewSelectionResult}
 */
function selectCrewForFlight(flight, pilotPool, cabinPool, rulesOverride = {}) {
  const pilotRules = { ...defaultPilotRules, ...(rulesOverride.pilots || {}) };
  const cabinRules = { ...defaultCabinRules, ...(rulesOverride.cabin || {}) };

  const warnings = [];

  const eligiblePilots = pilotPool.filter(
    (p) =>
      p.vehicleType === flight.vehicleType &&
      flight.distanceKm <= p.maxDistanceKm
  );

  if (eligiblePilots.length === 0) {
    warnings.push(
      warn(
        "PILOT_NONE",
        "No eligible pilots for this aircraft/distance.",
        "error"
      )
    );
  }

  const pilots = greedySelectPilots(eligiblePilots, pilotRules, warnings, flight);

  const eligibleCabin = cabinPool.filter((a) =>
    a.vehicleTypes.includes(flight.vehicleType)
  );

  if (eligibleCabin.length === 0) {
    warnings.push(
      warn(
        "CABIN_NONE",
        "No eligible cabin crew for this aircraft.",
        "error"
      )
    );
  }

  const { cabin, selectedRecipes } = greedySelectCabin(
    eligibleCabin,
    cabinRules,
    warnings,
    flight
  );

  return { pilots, cabin, warnings, selectedRecipes };
}

function greedySelectPilots(pilots, rules, warnings, flight) {
  const seniors = pilots.filter((p) => p.seniority === "senior");
  const juniors = pilots.filter((p) => p.seniority === "junior");
  const trainees = pilots.filter((p) => p.seniority === "trainee");

  /** @type {Pilot[]} */
  const selected = [];

  function takeSome(source, count) {
    const taken = source.splice(0, count);
    selected.push(...taken);
  }

  // 1. Satisfy hard minimums
  if (seniors.length < rules.minSenior) {
    warnings.push(
      warn(
        "PILOT_SENIOR_SHORTAGE",
        `Need at least ${rules.minSenior} senior pilot(s), have ${seniors.length}.`,
        "error",
        { have: seniors.length, need: rules.minSenior, flightId: flight.flightId }
      )
    );
  }
  if (juniors.length < rules.minJunior) {
    warnings.push(
      warn(
        "PILOT_JUNIOR_SHORTAGE",
        `Need at least ${rules.minJunior} junior pilot(s), have ${juniors.length}.`,
        "error",
        { have: juniors.length, need: rules.minJunior, flightId: flight.flightId }
      )
    );
  }

  takeSome(seniors, Math.min(rules.minSenior, seniors.length));
  takeSome(juniors, Math.min(rules.minJunior, juniors.length));

  // 2. Fill remaining slots greedily up to maxTotal
  const remainingSlots = () =>
    Math.max(0, rules.maxTotal - selected.length);

  // Prefer more seniors/juniors before trainees
  if (remainingSlots() > 0 && seniors.length > 0) {
    takeSome(seniors, Math.min(remainingSlots(), seniors.length));
  }
  if (remainingSlots() > 0 && juniors.length > 0) {
    takeSome(juniors, Math.min(remainingSlots(), juniors.length));
  }

  // Add trainees only if we still have room and under maxTrainee
  if (remainingSlots() > 0 && trainees.length > 0) {
    const allowedTrainees = Math.min(
      remainingSlots(),
      rules.maxTrainee
    );
    takeSome(trainees, allowedTrainees);
    if (trainees.length > 0) {
      warnings.push(
        warn(
          "PILOT_TRAINEES_LEFT",
          "Some trainees not used in roster (max trainees limit reached).",
          "info",
          { unusedTrainees: trainees.map((t) => t.pilotId) }
        )
      );
    }
  }

  // 3. Post validations
  const seniorCount = selected.filter((p) => p.seniority === "senior").length;
  const juniorCount = selected.filter((p) => p.seniority === "junior").length;
  const traineeCount = selected.filter((p) => p.seniority === "trainee").length;

  if (seniorCount === 0 || juniorCount === 0) {
    warnings.push(
      warn(
        "PILOT_COMPOSITION_INVALID",
        "Roster must contain at least one senior and one junior pilot.",
        "error",
        { seniorCount, juniorCount }
      )
    );
  }

  if (traineeCount > rules.maxTrainee) {
    warnings.push(
      warn(
        "PILOT_TOO_MANY_TRAINEES",
        `Roster has ${traineeCount} trainees; max allowed is ${rules.maxTrainee}.`,
        "error",
        { traineeCount, maxTrainee: rules.maxTrainee }
      )
    );
  }

  if (selected.length < rules.minTotal) {
    warnings.push(
      warn(
        "PILOT_TOO_FEW",
        `Roster has ${selected.length} pilots; min required is ${rules.minTotal}.`,
        "error",
        { count: selected.length, minTotal: rules.minTotal }
      )
    );
  }

  return selected;
}

function greedySelectCabin(attendants, rules, warnings, flight) {
  const chiefs = attendants.filter((a) => a.isChief);
  const juniors = attendants.filter((a) => a.isJunior);
  const chefs = attendants.filter((a) => a.isChef);

  /** @type {Attendant[]} */
  const selected = [];
  /** @type {string[]} */
  const selectedRecipes = [];

  function takeSome(source, count) {
    const taken = source.splice(0, count);
    selected.push(...taken);
    return taken;
  }

  // Chiefs
  if (chiefs.length < rules.minChiefs) {
    warnings.push(
      warn(
        "CABIN_CHIEF_SHORTAGE",
        `Need at least ${rules.minChiefs} chief(s), have ${chiefs.length}.`,
        "error",
        { have: chiefs.length, need: rules.minChiefs, flightId: flight.flightId }
      )
    );
  }
  takeSome(chiefs, Math.min(rules.minChiefs, chiefs.length));
  if (chiefs.length > 0 && selected.filter((a) => a.isChief).length < rules.maxChiefs) {
    // optional extra chiefs, up to max
    const remainingChiefSlots =
      rules.maxChiefs - selected.filter((a) => a.isChief).length;
    takeSome(chiefs, Math.min(remainingChiefSlots, chiefs.length));
  }

  // Juniors
  if (juniors.length < rules.minJuniors) {
    warnings.push(
      warn(
        "CABIN_JUNIOR_SHORTAGE",
        `Need at least ${rules.minJuniors} junior attendants, have ${juniors.length}.`,
        "error",
        { have: juniors.length, need: rules.minJuniors, flightId: flight.flightId }
      )
    );
  }
  takeSome(juniors, Math.min(rules.minJuniors, juniors.length));
  if (
    juniors.length > 0 &&
    selected.filter((a) => a.isJunior).length < rules.maxJuniors
  ) {
    const remainingJuniorSlots =
      rules.maxJuniors - selected.filter((a) => a.isJunior).length;
    takeSome(juniors, Math.min(remainingJuniorSlots, juniors.length));
  }

  // Chefs
  const chefCountToUse = Math.min(chefs.length, rules.maxChefs);
  const usedChefs = takeSome(chefs, chefCountToUse);

  if (chefCountToUse < rules.minChefs) {
    warnings.push(
      warn(
        "CABIN_CHEF_SHORTAGE",
        `Need at least ${rules.minChefs} chef(s), have ${chefCountToUse}.`,
        "error",
        { have: chefCountToUse, need: rules.minChefs, flightId: flight.flightId }
      )
    );
  }

  // Menu recipes – if any chef present, pick one random recipe from each
  for (const chef of usedChefs) {
    if (Array.isArray(chef.recipes) && chef.recipes.length > 0) {
      const idx = Math.floor(Math.random() * chef.recipes.length);
      selectedRecipes.push(chef.recipes[idx]);
    } else {
      warnings.push(
        warn(
          "CHEF_NO_RECIPES",
          `Chef ${chef.attendantId} has no recipes defined.`,
          "warning"
        )
      );
    }
  }

  // Final validations
  const chiefCount = selected.filter((a) => a.isChief).length;
  const juniorCount = selected.filter((a) => a.isJunior).length;
  const chefCount = selected.filter((a) => a.isChef).length;

  if (chiefCount < rules.minChiefs || chiefCount > rules.maxChiefs) {
    warnings.push(
      warn(
        "CABIN_CHIEF_RANGE",
        `Chief count ${chiefCount} is outside allowed range ${rules.minChiefs}–${rules.maxChiefs}.`,
        "error",
        { chiefCount }
      )
    );
  }

  if (juniorCount < rules.minJuniors || juniorCount > rules.maxJuniors) {
    warnings.push(
      warn(
        "CABIN_JUNIOR_RANGE",
        `Junior count ${juniorCount} is outside allowed range ${rules.minJuniors}–${rules.maxJuniors}.`,
        "error",
        { juniorCount }
      )
    );
  }

  if (chefCount < rules.minChefs || chefCount > rules.maxChefs) {
    warnings.push(
      warn(
        "CABIN_CHEF_RANGE",
        `Chef count ${chefCount} is outside allowed range ${rules.minChefs}–${rules.maxChefs}.`,
        "error",
        { chefCount }
      )
    );
  }

  return { cabin: selected, selectedRecipes };
}

module.exports = {
  selectCrewForFlight,
  defaultPilotRules,
  defaultCabinRules
};
