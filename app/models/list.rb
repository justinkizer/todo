class List < ApplicationRecord

  validates :title, :author_id, :list_order_number, presence: true

  belongs_to :author,
    class_name: User,
    foreign_key: :author_id

  has_many :tasks

end
