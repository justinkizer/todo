# This file should contain all the record creation needed to seed the database
# with its default values.
# The data can then be loaded with the rails db:seed command (or created
# alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings'
# }])
#   Character.create(name: 'Luke', movie: movies.first)

def create_task(list_id, body, task_order_number)
  Task.create(
    list_id: list_id, body: body, task_order_number: task_order_number
  )
end

@picard = User.create(
  username: 'JeanLucPicard',
  password: '123123123123',
  background_preference: 3
)
@picards_list_01 = List.create(
  title: 'Captain\'s Log (of stuff to do)',
  author_id: @picard.id,
  list_order_number: 0
)
@picards_list_02 = List.create(
  title: 'Shore Leave Itinerary',
  author_id: @picard.id,
  list_order_number: 1
)
@picards_list_03 = List.create(
  title: 'Tōdō To-Dos',
  author_id: @picard.id,
  list_order_number: 2
)

picards_list_01_tasks = [
  'Perform the "Picard Maneuver"',
  'Replicate some Tea (Earl Grey, Hot)',
  'Avoid children',
  'Shoot down some of Warf\'s ideas',
  'Practice my Ressikan flute'
]

picards_list_02_tasks = [
  'Search for Artifacts (they belong in a museum!)',
  'Read Shakespeare (aloud to my goldfish)',
  'Meet Beverly on the Holodeck as Dixon Hill',
  'Dust starship models'
]

picards_list_03_tasks = [
  'Set up batched queries to increase efficiency related to server pings',
  'Implement more graceful fail states (e.g. provide more specific responses)',
  'Add "delete confirmations" modals for list deletion',
  'Complete Github README'
]

picards_list_01_tasks.each_with_index do |body, index|
  create_task(@picards_list_01.id, body, index)
end

picards_list_02_tasks.each_with_index do |body, index|
  create_task(@picards_list_02.id, body, index)
end

picards_list_03_tasks.each_with_index do |body, index|
  create_task(@picards_list_03.id, body, index)
end

@data = User.create(
  username: 'Data',
  password: 'spot123',
  background_preference: 4
)
@datas_list_01 = List.create(
  title: 'Data\'s Daily Duties',
  list_order_number: 0,
  author_id: @data.id
)

datas_list_01_tasks = [
  'Feed spot',
  'People-watch in Ten Forward',
  'Meet Geordi and Wes in the Holodeck',
  'Paint surrealist self portrait',
  'Join the bridge crew for Poker',
  'Play the violin'
]

datas_list_01_tasks.each_with_index do |body, index|
  create_task(@datas_list_01.id, body, index)
end
