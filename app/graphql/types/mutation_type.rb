Types::MutationType = GraphQL::ObjectType.define do
  name 'Mutation'

  field :createUser, UserType do
    description 'Creates a user using an input username and password'
    argument :username, !types.String
    argument :password, !types.String

    resolve ->(_obj, args, ctx) {
      ctx[:create_user].call(args[:username], args[:password])
    }
  end

  field :updateUser, UserType do
    description 'Updates a user using an input background preference'
    argument :backgroundPreference, !types.Int

    resolve ->(_obj, args, ctx) {
      ctx[:update_user].call(args[:backgroundPreference])
    }
  end

  field :signInUser, UserType do
    description 'Signs in an extant user using an input username and password'
    argument :username, !types.String
    argument :password, !types.String

    resolve ->(_obj, args, ctx) {
      ctx[:signin_user].call(nil, args[:username], args[:password])
    }
  end

  field :signOutUser, UserType do
    description 'Signs out the currently authenticated user'

    resolve ->(_obj, _args, ctx) {
      ctx[:signout_user].call
    }
  end

  field :createList, ListType do
    description 'Creates a list using an input title'
    argument :title, !types.String

    resolve ->(_obj, args, ctx) {
      if ctx[:current_user]
        List.create(
          author_id: ctx[:current_user].id,
          title: args[:title],
          list_order_number: ctx[:current_user].lists.length
        )
      end
    }
  end

  field :updateList, ListType do
    description 'Updates a list using an input listId, title, and ' +
                'listOrderNumber'
    argument :listId, !types.Int
    argument :title, types.String
    argument :listOrderNumber, types.Int

    resolve ->(_obj, args, ctx) {
      user = ctx[:current_user]
      if user && user.lists.find(args[:listId])
        list = List.find(args[:listId])
        title = args[:title].nil? ? list.title : args[:title]
        if args[:listOrderNumber].nil?
          list_order_number = list.list_order_number
        else
          list_order_number = args[:listOrderNumber]
        end
        list.update(title: title, list_order_number: list_order_number)
      end
      list
    }
  end

  field :deleteList, ListType do
    description 'Deletes a list using an unput listId'
    argument :listId, !types.Int

    resolve ->(_obj, args, ctx) {
      if ctx[:current_user] && ctx[:current_user].lists.find(args[:listId])
        List.find(args[:listId]).destroy
      end
    }
  end

  field :createTask, TaskType do
    description 'Creates a task using an input listId and body'
    argument :listId, !types.Int
    argument :body, !types.String

    resolve ->(_obj, args, ctx) {
      user = ctx[:current_user]
      if user && user.lists.find(args[:listId])
        Task.create(
          list_id: args[:listId],
          body: args[:body],
          task_order_number: List.find(args[:listId]).tasks.length
        )
      end
    }
  end

  field :updateTask, TaskType do
    description 'Updates a task using an input taskId, body, and ' +
                'taskOrderNumber'
    argument :taskId, !types.Int
    argument :body, types.String
    argument :taskOrderNumber, types.Int

    resolve ->(_obj, args, ctx) {
      user = ctx[:current_user]
      if user && user.tasks.find(args[:taskId])
        task = Task.find(args[:taskId])
        body = args[:body].nil? ? task.body : args[:body]
        if args[:taskOrderNumber].nil?
          task_order_number = task.task_order_number
        else
          task_order_number = args[:taskOrderNumber]
        end
        task.update(body: body, task_order_number: task_order_number)
      end
      task
    }
  end

  field :deleteTask, TaskType do
    description 'Deletes a task using an input taskId'
    argument :taskId, !types.Int

    resolve ->(_obj, args, ctx) {
      user = ctx[:current_user]
      if user && user.tasks.find(args[:taskId])
        Task.find(args[:taskId]).destroy
      end
    }
  end

end
