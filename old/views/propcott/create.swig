{% extends '../base.swig' %}

{% block title %}Start a Propcott{% endblock %}

{% block form-wrap %}/editor/handle{% endblock %}

{% block head.end %}
	{% parent %}
	<style type="text/css">
		body {
			padding-top: 0;
		}
		#navigation, .navigation {
			position: relative;
		}
		#cke_propcott-how .cke_editable, #cke_propcott-alt .cke_editable {
			padding: 1em !important;
		}
		#cke_propcott-how p, #cke_propcott-alt p {
			margin: 0;
			padding-left: 2em;
			position: relative;
		}
		#cke_propcott-how p:before, #cke_propcott-alt p:before {
			content: '\2022';
			font-size: 1.5em;
			position: absolute;
			top: 0;
			left: 0.55em;
			line-height: 1.5;
		}
		#propcott-media .dropzone {
			height: 250px;
			background: rgba(0,0,0,0.8);
			padding: 60px 30px;
			color: white;
			text-align: center;
			font-family: 'Josefin Sans',sans-serif;
			line-height: 1.2;
			font-size: 1.4em;
		}
		#propcott-media .dropzone button {
			color: inherit;
			background: transparent;
			cursor: pointer;
			font-weight: normal;
			display: inline-block;
			margin: .5em;
			padding: .5em;
			border: 1px solid rgba(0,0,0,0.1);
			border-radius: 5px;
			outline: none;
			transition: 300ms;
		}
		#propcott-media .dropzone button:hover {
			background: rgba(255,255,255,0.1);
		}
		#propcott-media.filled .dropzone {
			opacity: 0;
			transition: 300ms;
		}
		#propcott-media.filled:hover .dropzone {
			opacity: 1;
		}
	</style>
	<script type="text/javascript" src="/js/ckeditor/ckeditor.js"></script>
{% endblock %}

{% block body.end %}
<script type="text/javascript">
function chooseVideo() {
	var video = prompt("Please enter the YouTube video URL");
	if(!video) return;

	var id = (video.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]{11}).*/)||[])[7];
	if (id) {
		document.getElementById('media-type').value = 'video';
		document.getElementById('media-link').value = id;

		document.getElementById('propcott-media').style.backgroundImage = 'url(http://img.youtube.com/vi/' + id + '/mqdefault.jpg)';
		document.getElementById('propcott-media').className = 'filled';
	}
}

window.ondragover = function(e) { e.preventDefault(); }
window.ondrop = function(e) { e.preventDefault(); upload(e.dataTransfer.files[0]); }

function upload(file) {
	if (!file || file.type.indexOf('image') == -1) return;

	var data = new FormData();
	data.append('file', file);
	data.append('name', file.name);
	data.append('_token', '{{ csrf_token() }}');
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/api/upload');
	xhr.onload = function() {
		var data = JSON.parse(xhr.responseText);
		document.getElementById('media-type').value = 'image';
		document.getElementById('media-link').value = data.path;

		document.getElementById('propcott-media').style.backgroundImage = 'url(//static.propcott.com/' + data.path + ')';
		document.getElementById('propcott-media').className = 'filled';
	}

	xhr.send(data);
}

document.getElementById('propcott-why').placeholder = '<p>' + document.getElementById('propcott-why').placeholder + '</p>';
document.getElementById('propcott-how').placeholder = '<p>' + document.getElementById('propcott-how').placeholder + '</p>';
document.getElementById('propcott-alt').placeholder = '<p>' + document.getElementById('propcott-alt').placeholder + '</p>';

CKEDITOR.replace('propcott-why', {
	allowedContent: 'u em strong ul ol li;a[!href]',
	height: 'auto',
	extraPlugins: 'confighelper',
	title: ''
}).on('change', function() {
	this.updateElement();
});

CKEDITOR.replace('propcott-how', {
	allowedContent: 'p',
	height: 'auto',
	extraPlugins: 'confighelper',
	removePlugins: 'toolbar',
	title: '',
	autoUpdateElement: false
}).on('change', function() {
	this.element.setText('<ul>' + this.getData().replace(/<(\/)?p>/g, '<$1li>') + '</ul>');
});

CKEDITOR.replace('propcott-alt', {
	allowedContent: 'p',
	height: 'auto',
	extraPlugins: 'confighelper',
	removePlugins: 'toolbar',
	title: '',
	autoUpdateElement: false
}).on('change', function() {
	this.element.setText('<ul>' + this.getData().replace(/<(\/)?p>/g, '<$1li>') + '</ul>');
});

for(var e=document.querySelectorAll('.autosize'), i=0; i<e.length; i++) (function(elem) {
	var verb = '', event = window.addEventListener || (verb = 'on', window.attachEvent);
	event.call(elem, verb + 'input', (function resize() {
		elem.rows = '1';
		elem.style.overflowY = 'hidden';
	    elem.style.height = 'auto';
	    elem.style.height = elem.scrollHeight + 'px';
	    return resize;
	})());
})(e[i]);

for(var e=document.querySelectorAll('textarea'), i=0; i<e.length; i++) (function(elem) {
	var verb = '', event = window.addEventListener || (verb = 'on', window.attachEvent);
	event.call(elem, verb + 'keypress', function (event) {
		if(event.which == '13') event.preventDefault();
	});
})(e[i]);

var verb = '', event = window.addEventListener || (verb = 'on', window.attachEvent);
var origSize = 48;
var oldLength;
event.call(document.getElementById('propcott-title'), verb + 'input', function() {
	if(!oldLength || oldLength > this.value.length) {
		console.log(this.clientHeight <= 250, parseFloat(this.style.fontSize), origSize);
		while(this.clientHeight <= 250 && parseFloat(this.style.fontSize) <= origSize) {
			this.style.fontSize = Math.min(origSize, parseFloat(this.style.fontSize || origSize) / .95) + 'px';
			if(parseFloat(this.style.fontSize) >= origSize) break;
			this.rows = '1';
			this.style.overflowY = 'hidden';
		    this.style.height = 'auto';
		    this.style.height = this.scrollHeight + 'px';
		}
		oldLength = this.value.length;
	}

	while(this.clientHeight > 250) {
		this.style.fontSize = parseFloat(this.style.fontSize || origSize) * .95 + 'px';
		this.rows = '1';
		this.style.overflowY = 'hidden';
	    this.style.height = 'auto';
	    this.style.height = this.scrollHeight + 'px';
	}
});

event.call(document.getElementById('form-wrap'), verb + 'submit', function() {
	document.getElementById('propcott-title_size').value = document.getElementById('propcott-title').style.fontSize;
});

</script>
{% endblock %}

{% block content %}
<div class="navigation" style="background-color: #397DD8; color: #ffffff;" data-sticky="0">
	<div class="container">
		<button class="block round navigation-item" type="submit" name="action" value="cancel" style="margin-left: -.75em;">
			<span class="navigation-text">Cancel</span>
			<span class="typcn typcn-times"></span>
		</button>
		<button class="block round navigation-item" type="submit" name="action" value="preview">
			<span class="navigation-text">Preview</span>
			<span class="typcn typcn-tick"></span>
		</button>
		<button class="block round navigation-item" type="submit" name="action" value="save">
			<span class="navigation-text">Save Propcott</span>
			<span class="typcn typcn-pin"></span>
		</button>
	</div>
</div>

<div class="container">
	<div class="row">
		<div class="col-7 push-5">
			<div id="propcott" class="propcott-full">
				<div id="propcott-featured-image">
					<input type="hidden" name="propcott-title_size" id="propcott-title_size">
					<textarea id="propcott-title"
							  name="propcott-title"
							  class="autosize"
							  placeholder="Enter a title"
							  style="font-size: {{ propcott.title_size }}"
							  maxlength="255"
							  >{{ propcott.title }}</textarea>
				</div>
				<div id="propcott-content">
					<div class="propcott-outside-placeholder">
						<div class="propcott-outside">
							<h2>Who <br /><small>is your intended target?</small></h2>
							<span class="question-mark">
								<span class="question-mark-icon">?</span>
								<span class="question-mark-container">
									<span class="question-mark-text">We structured Propcott to target each target one at a time to ensure higher effectiveness</span>
								</span>
							</span>
						</div>
					</div>

					<p style="position: absolute; margin: 1em; pointer-events: none; color: rgb(215,0,0);">Propcotting </p>
					<textarea id="propcott-target"
							  name="propcott-target"
							  class="editable-region autosize"
							  placeholder="corporation, person, organization etc."
							  style="text-indent:6.2em;"
							  >{{ propcott.target }}</textarea>

					<hr />

					<p style="font-style: italic;padding: 1em;margin: 0; cursor: default;" id="industry-container">What industry are they in?
					<select id="propcott-industry"
							style="font-style: normal; border: 0; outline: 0; padding:.5em; background: rgba(0,0,0,0.025); cursor: pointer;">
						<option>Choose an Industry</option>
						<option>Other</option>
						<option>Agriculture</option>
						<option>Grocery</option>
						<option>Accounting</option>
						<option>Health Care</option>
						<option>Advertising</option>
						<option>Internet Publishing</option>
						<option>Aerospace</option>
						<option>Investment Banking</option>
						<option>Aircraft</option>
						<option>Legal</option>
						<option>Airline</option>
						<option>Manufacturing</option>
						<option>Apparel &amp; Accessories</option>
						<option>Motion Picture &amp; Video</option>
						<option>Automotive</option>
						<option>Music</option>
						<option>Banking</option>
						<option>Newspaper Publishers</option>
						<option>Broadcasting</option>
						<option>Online Auctions</option>
						<option>Brokerage</option>
						<option>Pension Funds</option>
						<option>Biotechnology</option>
						<option>Pharmaceuticals</option>
						<option>Call Centers</option>
						<option>Private Equity</option>
						<option>Cargo Handling</option>
						<option>Publishing</option>
						<option>Chemical</option>
						<option>Real Estate</option>
						<option>Computer</option>
						<option>Retail &amp; Wholesale</option>
						<option>Consulting</option>
						<option>Securities &amp; Commodity Exchanges</option>
						<option>Consumer Products</option>
						<option>Service</option>
						<option>Cosmetics</option>
						<option>Soap &amp; Detergent</option>
						<option>Defense</option>
						<option>Software</option>
						<option>Department Stores</option>
						<option>Sports</option>
						<option>Education</option>
						<option>Technology</option>
						<option>Electronics</option>
						<option>Telecommunications</option>
						<option>Energy</option>
						<option>Television</option>
						<option>Entertainment &amp; Leisure</option>
						<option>Transportation</option>
						<option>Executive Search</option>
						<option>Trucking</option>
						<option>Financial Services</option>
						<option>Venture Capital</option>
						<option>Food, Beverage &amp; Tobacco</option>
					</select></p>

					<hr />

					<div class="propcott-outside-placeholder">
						<div class="propcott-outside">
							<h2>What <br /><small>is the goal of your propcott?</small></h2>
							<span class="question-mark">
								<span class="question-mark-icon">?</span>
								<span class="question-mark-container">
									<span class="question-mark-text">i.e. To change a policy of a company, To simply stop etc.</span>
								</span>
							</span>
						</div>
					</div>

					<textarea id="propcott-what"
							  name="propcott-what"
							  class="editable-region autosize"
							  placeholder="What do you hope to accomplish?"
							  >{{ propcott.what }}</textarea>

					<hr />

					<div class="propcott-outside-placeholder">
						<div class="propcott-outside">
							<h2>Why <br /><small>should others join?</small></h2>
							<span class="question-mark">
								<span class="question-mark-icon">?</span>
								<span class="question-mark-container">
									<span class="question-mark-text">What compelled you to start this and why should others join you?</span>
								</span>
							</span>
						</div>
					</div>

					<textarea id="propcott-why"
							  name="propcott-why"
							  class="editable-region autosize"
							  placeholder="Background / Description"
							  >{{ propcott.why }}</textarea>

					<hr />

					<div class="propcott-outside-placeholder">
						<div class="propcott-outside">
							<h2>How <br /><small>can we take action?</small></h2>
							<span class="question-mark">
								<span class="question-mark-icon">?</span>
								<span class="question-mark-container">
									<span class="question-mark-text">i.e. do not purchase this product, do not watch this movie, do not click, do not attend, etc.</span>
								</span>
							</span>
						</div>
					</div>

					<textarea id="propcott-how"
							  name="propcott-how"
							  class="editable-region autosize"
							  placeholder="Course of action"
							  >{{ propcott.how }}</textarea>

					<hr />

					<div class="propcott-outside-placeholder">
						<div class="propcott-outside">
							<h2><small>Alternative <br />(optional)</small></h2>
							<span class="question-mark">
								<span class="question-mark-icon">?</span>
								<span class="question-mark-container">
									<span class="question-mark-text">Wisely choose a viable replacement to the target</span>
								</span>
							</span>
						</div>
					</div>

					<textarea id="propcott-alt"
							  name="propcott-alt"
							  class="editable-region autosize"
							  placeholder="Provide an alternative to the target"
							  >{{ propcott.alt }}</textarea>

					<hr>

					<div style="padding: .5em 1em; text-align: center;">
						<button class="block radius navigation-item" type="submit" name="action" value="preview">
							<span class="navigation-text">Preview</span>
							<span class="typcn typcn-tick"></span>
						</button>
						<button class="block radius navigation-item" type="submit" name="action" value="save">
							<span class="navigation-text">Save Propcott</span>
							<span class="typcn typcn-pin"></span>
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="col-5 pull-7">
			<div id="propcott-sidebar">
				{% if propcott.media_type == 'image' %}
				<div id="propcott-media" style="background-image: url('http://static.propcott.com/{{ propcott.media_link }}');" class="filled">
					<div class="dropzone">
						drag and drop image here<br>or<br>
						<button type="button" onclick="document.getElementById('media-photo').click()">upload<br>image</button>
						<button type="button" onclick="chooseVideo()">embed<br>youtube</button>
						<input type="hidden" name="propcott-media_type" value="{{ propcott.media_type }}" id="media-type">
						<input type="hidden" name="propcott-media_link" value="{{ propcott.media_link }}" id="media-link">
						<input type="file" id="media-photo" style="visibility: collapse; width: 0px;" onchange="upload(this.files[0])">
					</div>
				</div>
				{% elseif propcott.media_type == 'video' %}
				<div id="propcott-media" style="background-image: url('http://img.youtube.com/vi/{{ propcott.media_link }}/mqdefault.jpg');" class="filled">
					<div class="dropzone">
						drag and drop image here<br>or<br>
						<button type="button" onclick="document.getElementById('media-photo').click()">upload<br>image</button>
						<button type="button" onclick="chooseVideo()">embed<br>youtube</button>
						<input type="hidden" name="propcott-media_type" value="{{ propcott.media_type }}" id="media-type">
						<input type="hidden" name="propcott-media_link" value="{{ propcott.media_link }}" id="media-link">
						<input type="file" id="media-photo" style="visibility: collapse; width: 0px;" onchange="upload(this.files[0])">
					</div>
				</div>
				{% else %}
				<div id="propcott-media">
					<div class="dropzone">
						drag and drop image here<br>or<br>
						<button type="button" onclick="document.getElementById('media-photo').click()">upload<br>image</button>
						<button type="button" onclick="chooseVideo()">embed<br>youtube</button>
						<input type="hidden" name="propcott-media_type" value="{{ propcott.media_type }}" id="media-type">
						<input type="hidden" name="propcott-media_link" value="{{ propcott.media_link }}" id="media-link">
						<input type="file" id="media-photo" style="visibility: collapse; width: 0px;" onchange="upload(this.files[0])">
					</div>
				</div>
				{% endif %}
			</div>
		</div>
	</div>

	<input type="hidden" name="propcott-id" value="{{ propcott.id }}" />
</div>
{% endblock %}
