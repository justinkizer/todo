class CreateTasks < ActiveRecord::Migration[5.0]
  def change
    create_table :tasks do |t|
      t.text :body, null: false
      t.integer :task_order_number, null: false
      t.integer :list_id, null: false

      t.timestamps
    end
    add_index :tasks, :list_id
  end
end
