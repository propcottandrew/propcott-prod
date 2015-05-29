<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersSocialAccountsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('users_social_accounts', function(Blueprint $table)
		{
			$table->increments('id');
			
			$table->integer('user_id')->unsigned();
			$table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
			
			$table->enum('provider', ['facebook', 'twitter', 'google']);
			$table->string('provider_id')->unique();
			$table->string('name')->nullable();
			$table->string('email')->nullable();
			$table->string('avatar')->nullable();
			//$table->string('token', 32);
			//$table->rememberToken();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('users_social_accounts');
	}

}
