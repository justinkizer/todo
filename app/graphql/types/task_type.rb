TaskType = GraphQL::ObjectType.define do
  name 'Task'
  description 'Fields: "id", "body", and "taskOrderNumber"'

  field :id, !types.Int
  field :listId, !types.Int, property: :list_id 
  field :body, !types.String
  field :taskOrderNumber, !types.Int, property: :task_order_number
end
