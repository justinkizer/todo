class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  helper_method :signed_in?, :current_user

  def current_user
    @current_user ||= User.find_by_session_token(session[:session_token])
  end

  def signed_in?
    !!current_user
  end

  def create_user
    Proc.new do |username, password|
      @user = User.new(username: username, password: password)
      if @user.save
        signin_user.call(@user)
        @user
      else
        @user.errors.full_messages
      end
    end
  end

  def update_user
    Proc.new do |background_preference|
      @user = User.find_by_session_token(session[:session_token])
      if @user && @user.update(background_preference: background_preference)
        @user
      else
        @user.errors.full_messages
      end
    end
  end

  def signin_user
    Proc.new do |user, username = nil, password = nil|
      if username && password
        user = User.find_by_credentials(username, password)
      end
      if user
        @current_user = user
        user.reset_session_token!
        session[:session_token] = user.session_token
      end
      user
    end
  end

  def signout_user
    Proc.new do
      current_user.reset_session_token!
      @current_user = nil
      session[:session_token] = nil
    end
  end

end
