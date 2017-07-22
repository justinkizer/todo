require_relative 'user_type.rb'
require_relative 'list_type.rb'
require_relative 'task_type.rb'

Types::QueryType = GraphQL::ObjectType.define do
  name 'Query'
  description 'Entry points: "user", "lists", "list(id: x)", and "task(id: x)"'

  field :user do
    description 'Exposes the authenticated username and background preference'
    type UserType
    resolve ->(_obj, _args, ctx) { ctx[:current_user] }
  end

  field :lists do
    description 'Exposes the authenticated User\'s lists and tasks data'
    type -> { types[ListType] }
    resolve ->(_obj, _args, ctx) { ctx[:current_user].lists }
  end

  field :list do
    description 'Exposes the authenticated User\'s list data via the list ID'
    argument :id, !types.Int
    type -> { ListType }
    resolve ->(_obj, args, ctx) { ctx[:current_user].lists.find(args[:id]) }
  end

  field :task do
    description 'Exposes the authenticated User\'s task data via the task ID'
    argument :id, !types.Int
    type -> { TaskType }
    resolve ->(_obj, args, ctx) { ctx[:current_user].tasks.find(args[:id]) }
  end
  
end
