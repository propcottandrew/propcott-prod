<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class UserSocialAccount extends Model {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users_social_accounts';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [
		
	];

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = [
		
	];
	
	public function user()
	{
		return $this->belongsTo('App\User', 'user_id', 'id');
	}
	
}
