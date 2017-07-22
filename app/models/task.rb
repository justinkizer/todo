class Task < ApplicationRecord

  validates :body, :list_id, :task_order_number, presence: true

  belongs_to :list

  has_one :author,
    through: :list,
    source: :author

end
