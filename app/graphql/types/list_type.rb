ListType = GraphQL::ObjectType.define do
  name 'List'
  description 'Fields: "id", "title", "listOrderNumber", and "tasks"'

  field :id, !types.Int
  field :title, !types.String
  field :listOrderNumber, !types.Int, property: :list_order_number
  field :tasks do
    type -> { types[TaskType] }
    resolve ->(list, _args, _ctx) { list.tasks }
  end
end
