{% extends 'base.swig' %}

{% block title %}General Settings{% endblock %}

{% block account.main %}
<div class="account-block">
	<h2>General <small>settings</small></h2>
	<p style="margin: 0;">&nbsp;</p>
	<form role="form" method="POST" action="account">
		{{ csrf_input() }}

<table>
	<tr>
		<th>Name</th>
		<td><input type="text" name="name" value="{{ user.name }}"></td>
	</tr>
	<tr>
		<th>Display Name</th>
		<td><input type="text" name="display_name" value="{{ user.display_name }}"></td>
	</tr>
	<tr>
		<th>Email address</th>
		<td><input type="email" name="email" value="{{ user.email }}"></td>
	</tr>
	<tr>
		<th>Password</th>
		<td><input type="password" name="password"></td>
	</tr>
	<tr>
		<th>Repeat</th>
		<td><input type="password" name="password_verify"></td>
	</tr>
	<tr>
		<th>Zip Code</th>
		<td><input type="text" name="zip" value="{{ user.zip }}"></td>
	</tr>
	<tr>
		<th>Organization</th>
		<td><input type="text" name="org" value="{{ user.org }}"></td>
	</tr>
	<tr>
		<th>Organization Website</th>
		<td><input type="text" name="org_link" value="{{ user.org_link }}"></td>
	</tr>
	<tr>
		<th>Birthday</th>
		<td>
		<select name="birth-month">
			<option value="1"{% if user.birth_month == 1 %} selected="true"{% endif %}>January</option>
			<option value="2"{% if user.birth_month == 2 %} selected="true"{% endif %}>February</option>
			<option value="3"{% if user.birth_month == 3 %} selected="true"{% endif %}>March</option>
			<option value="4"{% if user.birth_month == 4 %} selected="true"{% endif %}>April</option>
			<option value="5"{% if user.birth_month == 5 %} selected="true"{% endif %}>May</option>
			<option value="6"{% if user.birth_month == 6 %} selected="true"{% endif %}>June</option>
			<option value="7"{% if user.birth_month == 7 %} selected="true"{% endif %}>July</option>
			<option value="8"{% if user.birth_month == 8 %} selected="true"{% endif %}>August</option>
			<option value="9"{% if user.birth_month == 9 %} selected="true"{% endif %}>September</option>
			<option value="10"{% if user.birth_month == 10 %} selected="true"{% endif %}>October</option>
			<option value="11"{% if user.birth_month == 11 %} selected="true"{% endif %}>November</option>
			<option value="12"{% if user.birth_month == 12 %} selected="true"{% endif %}>December</option>
		</select>
		<input name="birth-year" placeholder="Year" maxlength="4" style="width: 6ex;" onchange="if(/[^d]/.test(this.value)) this.value=this.value.replace(/[^\d]/g,'')" onkeypress="return event.charCode >= 48 && event.charCode <= 57" value="{{ user.birth_year || '' }}">
		</td>
	</tr>
	<tr>
		<th>Gender</th>
		<td><select name="gender">
			<option value="1"{% if user.gender == 1 %} selected="true"{% endif %}>Male</option>
			<option value="0"{% if user.gender == 0 %} selected="true"{% endif %}>Female</option>
		</select></td>
	</tr>
</table>
		<!--p>Avatar: <img src="{{ user.avatar }}" style="max-width:80px; max-height:80px; margin-right:10px; border-radius:8px;" /> <input name="avatar" type="file" style="display:inline;" /></p-->
		<p><input type="submit" value="Update"></p>
	</form>
</div>

<div class="account-block">
	<h2>Close <small>your account</small></h2>
	<p><a href="{{ url('/account/merge') }}">Merge</a> with another Propcott account.</p>
	<p><a href="{{ url('/account/close') }}">Close</a> your Propcott account.</p>
</div>
{% endblock %}
