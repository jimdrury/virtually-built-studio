export type GuestDefinition = {
  id: string
  name: string
  role: string
}

export const GUEST_DEFINITIONS: GuestDefinition[] = [
  {id: 'guest-sarah-chen', name: 'Sarah Chen', role: 'Staff engineer'},
  {id: 'guest-marcus-webb', name: 'Marcus Webb', role: 'Platform architect'},
  {id: 'guest-elena-torres', name: 'Elena Torres', role: 'Engineering manager'},
  {id: 'guest-james-okonkwo', name: 'James Okonkwo', role: 'Developer advocate'},
  {id: 'guest-priya-sharma', name: 'Priya Sharma', role: 'ML engineer'},
  {id: 'guest-sam-rivera', name: 'Sam Rivera', role: 'Design systems lead'},
  {id: 'guest-alex-kim', name: 'Alex Kim', role: 'Product engineer'},
]
