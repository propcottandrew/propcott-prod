<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\Services\Registrar;

class DatabaseSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		Model::unguard();

		$this->call('UserTableSeeder');
	}

}

class UserTableSeeder extends Seeder {
	
	public function __construct(Registrar $registrar)
	{
		$this->registrar = $registrar;
	}
	
    public function run()
    {
        DB::table('users')->delete();

        $this->registrar->create([
			'name' => 'Evan Kennedy',
			'email' => 'evan_kennedy@yahoo.com',
			'password' => 'soccer3'
		]);
		
		$faker = Faker\Factory::create();
 
		for ($i = 0; $i < 50; $i++)
		{
			$this->registrar->create([
				'name' => $faker->name,
				'email' => $faker->email,
				'password' => $faker->password
			]);
		}
    }

}
