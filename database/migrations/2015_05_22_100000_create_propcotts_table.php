<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePropcottsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('propcotts', function(Blueprint $table)
		{
			$table->increments('id');
			$table->string('name')->nullable();
			$table->string('title')->nullable();
			$table->string('featured')->nullable();
			$table->string('target')->nullable();
			$table->longText('description')->nullable();
			$table->string('goal')->nullable();
			$table->string('criteria')->nullable();
			$table->string('action')->nullable();
			$table->string('alternative')->nullable();
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
		Schema::drop('propcotts');
	}

}
