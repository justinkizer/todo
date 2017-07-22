class CreateLists < ActiveRecord::Migration[5.0]
  def change
    create_table :lists do |t|
      t.string :title, null: false
      t.integer :list_order_number, null: false
      t.integer :author_id, null: false

      t.timestamps
    end
    add_index :lists, :author_id
  end
end
