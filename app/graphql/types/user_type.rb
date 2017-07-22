UserType = GraphQL::ObjectType.define do
  name 'User'
  description 'Fields: "username" and "backgroundPreference"'

  field :username, !types.String
  field :backgroundPreference, !types.Int, property: :background_preference
end
