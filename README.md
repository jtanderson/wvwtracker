# WvW Tracker
Guild Wars 2 WvW Presence Monitor

This is a prototype of a tool to keep track of WvW scouting, upgrading, and roaming coverage in Guild Wars 2. Contingent on usuage/interest, development will be ongoing.

Right now there is basically one feature: you can add your name (honor system for now) to an objective by clicking that objective icon on the map, putting your name in the box, and clicking "Add". This designates that you are upgrading that objective, or scouting/roaming nearby. When finished, kindly remove your name from the list by clicking the minus sign next to your name.

## Contributing

Obviously anybody can clone this repository and `meteor deploy` it to get their own instance, or just run it locally and submit pull requests back here.

### TODO:

- [x] Add/remove names to various objectives
- [x] Show counter next to objectives, how many names it has (give an easier way to scan the map)
- [ ] More objective marker detail
  - [x] Change icon colors to reflect current owner (similar to wvwintel.com)
  - [ ] Show current upgrades (also similar to wvwintel.com)
  - [ ] Show RI timer
  - [ ] Show guild claiming
- [ ] Event log
  - [x] Record users logging into different locations and leaving
  - [x] Record objectives changing hands
  - [x] Tag different events (objective changes hands, users arrive/leave locations)
  - [ ] Filter by map (EB, various borderlands)
- [x] Add preset map zooms (similar to wvwintel.com), click button, zoom to one particular map, automatically filter event log to that map
- [x] User signup/authentication
- [ ] Integrate user accounts, create profiles, groups, etc.
- [ ] Restrict access to only authenticated (and approved?) users

