export default {
	fetch(request) {
		const url = new URL(request.url);
		return Response.redirect(`https://kcurtet.com${url.pathname}${url.search}`, 301);
	},
};
