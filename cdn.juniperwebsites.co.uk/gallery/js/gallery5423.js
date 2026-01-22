$(document).ready(function() {
	$('.content__album__list__item, .content__album__grid__item').each(function() {
		$li = $(this).is('li') ? $(this) : $(this).closest('li');
		$li.attr('data-src', $li.find('a').attr('href'));
		$li.attr('data-title', ($li.find('.title').text() !== '') ? $li.find('.title').text() : '');
		$li.attr('data-desc', ($li.find('.desc').text() !== '') ? $li.find('.desc').text() : '');
	});
	$('.content__album__list, .content__album__grid').addClass('content__album__list--lightgallery');
	lightGallery(document.querySelector('.content__album__list--lightgallery'), {
		download: false,
		licenseKey: '7DB49AAF-8BB9-4316-A46F-BD7D786BC346',
		plugins: [lgAutoplay, lgFullscreen, lgHash, lgThumbnail, lgZoom],
	});
});