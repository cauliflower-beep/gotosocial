/*
	GoToSocial
	Copyright (C) 2021-2022 GoToSocial Authors admin@gotosocial.org

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

const Promise = require('bluebird');
const React = require("react");

const FakeToot = require("../../components/fake-toot");
const MutateButton = require("../../components/mutation-button");

const { 
	useTextInput,
	useFileInput
} = require("../../components/form");

const query = require("../../lib/query");

module.exports = function NewEmojiForm({emoji}) {
	const emojiCodes = React.useMemo(() => {
		return new Set(emoji.map((e) => e.shortcode));
	}, [emoji]);

	const [addEmoji, result] = query.useAddEmojiMutation();

	const [onFileChange, resetFile, {image, imageURL, imageInfo}] = useFileInput("image", {
		withPreview: true,
		maxSize: 50 * 1024
	});

	const [onShortcodeChange, resetShortcode, {shortcode, setShortcode, shortcodeRef}] = useTextInput("shortcode", {
		validator: function validateShortcode(code) {
			return emojiCodes.has(code)
				? "Shortcode already in use"
				: "";
		}
	});

	React.useEffect(() => {
		if (shortcode.length == 0) {
			if (image != undefined) {
				let [name, _ext] = image.name.split(".");
				setShortcode(name);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [image]);

	function uploadEmoji(e) {
		if (e) {
			e.preventDefault();
		}

		Promise.try(() => {
			return addEmoji({
				image,
				shortcode
			});
		}).then(() => {
			resetFile();
			resetShortcode();
		});
	}

	let emojiOrShortcode = `:${shortcode}:`;

	if (imageURL != undefined) {
		emojiOrShortcode = <img
			className="emoji"
			src={imageURL}
			title={`:${shortcode}:`}
			alt={shortcode}
		/>;
	}

	return (
		<div>
			<h2>Add new custom emoji</h2>

			<FakeToot>
				Look at this new custom emoji {emojiOrShortcode} isn&apos;t it cool?
			</FakeToot>

			<form onSubmit={uploadEmoji} className="form-flex">
				<div className="form-field file">
					<label className="file-input button" htmlFor="image">
						Browse
					</label>
					{imageInfo}
					<input
						className="hidden"
						type="file"
						id="image"
						name="Image"
						accept="image/png,image/gif"
						onChange={onFileChange}
					/>
				</div>

				<div className="form-field text">
					<label htmlFor="shortcode">
						Shortcode, must be unique among the instance's local emoji
					</label>
					<input
						type="text"
						id="shortcode"
						name="Shortcode"
						ref={shortcodeRef}
						onChange={onShortcodeChange}
						value={shortcode}
					/>
				</div>
				
				<MutateButton text="Upload emoji" result={result}/>
			</form>
		</div>
	);
};