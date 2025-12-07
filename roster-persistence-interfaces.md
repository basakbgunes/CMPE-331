// domain/ports/RosterRepository.ts
interface RosterRepository {
  save(roster: Roster): Promise<Roster>;            // upsert
  findById(rosterId: string): Promise<Roster | null>;
  findByFlightId(flightId: string): Promise<Roster[]>; // for listing rosters of a flight
}


// application/RosterPersistenceService.ts
class RosterPersistenceService {
  constructor(
    private sqlRepo: RosterRepository,
    private nosqlRepo: RosterRepository
  ) {}

  async save(roster: Roster): Promise<Roster> {
    return roster.backend === "sql"
      ? this.sqlRepo.save(roster)
      : this.nosqlRepo.save(roster);
  }

  async findById(rosterId: string): Promise<Roster | null> {
    // backend is unknown → try SQL first, then NoSQL
    const fromSql = await this.sqlRepo.findById(rosterId);
    if (fromSql) return fromSql;
    return this.nosqlRepo.findById(rosterId);
  }

  async findByFlightId(flightId: string): Promise<Roster[]> {
    const sql = await this.sqlRepo.findByFlightId(flightId);
    const nosql = await this.nosqlRepo.findByFlightId(flightId);
    return [...sql, ...nosql];
  }
}


