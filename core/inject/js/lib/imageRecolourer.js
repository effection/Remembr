define(['jquery'], function($) {

	return function ImageRecolourer($img) {
		if($img.length <= 0) return;

		var img = $img[0];
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var originalPixels = null;
		var currentPixels = null;

		$img.on('load', getPixels);

		this.changeColour(newColor) = function(newColor) {
			if(!originalPixels) return; // Check if image has loaded
			
			for(var I = 0, L = originalPixels.data.length; I < L; I += 4)
			{
				if(currentPixels.data[I + 3] > 0)
				{
					currentPixels.data[I] = originalPixels.data[I] / 255 * newColor.R;
					currentPixels.data[I + 1] = originalPixels.data[I + 1] / 255 * newColor.G;
					currentPixels.data[I + 2] = originalPixels.data[I + 2] / 255 * newColor.B;
				}
			}
			
			ctx.putImageData(currentPixels, 0, 0);
			img.src = canvas.toDataURL("image/png");
		};

		/**		 * Get image pixels		 */		function getPixels()
		{
			canvas.width = img.width;
			canvas.height = img.height;
			
			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.width, img.height);
			originalPixels = ctx.getImageData(0, 0, img.width, img.height);
			currentPixels = ctx.getImageData(0, 0, img.width, img.height);
			
			$img.off('load', getPixels);
		}
	};
});