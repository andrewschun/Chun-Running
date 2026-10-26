/* Completion rules shared by the tracker and its tests. */
const OtaModel = {
  sessionComplete(session, checks = {}) {
    return session.drills.length > 0 && session.drills.every(drill => checks[drill.id] === true);
  },
  programComplete(sessions, checks = {}) {
    return sessions.length === 48 && sessions.every(session => this.sessionComplete(session, checks));
  },
  migrateSessions(sessions, legacy = {}) {
    const result = {};
    for (const session of sessions) {
      if (legacy[session.id] === true) {
        for (const drill of session.drills) result[drill.id] = true;
      }
    }
    return result;
  }
};
if (typeof module !== 'undefined') module.exports = OtaModel;
