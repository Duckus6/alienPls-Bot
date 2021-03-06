const fs = require('fs')
const {Formatters} = require("discord.js")


const updateSent = (sent) => {
	fs.writeFileSync('./data/sent.json', JSON.stringify(sent))
}

const notPlayed = (link, sent) => {
	time = Date.now() -3600000
	const find = sent.findIndex(item => item[0].link === link)
	console.log(find,link, sent)
	if (find === -1) return {sent, played:false}
	if (sent[find][1] <= time){
		sent.splice(find,1)
		console.log(sent)
		notPlayed(link,sent)
	}
	return {sent, played:true}
}


const checkSent = (sent) => {
	const time = Date.now() - 3600000
	const index = sent.findIndex(ele => ele[1] > time)
	sent.splice(0,index)
	return sent
}


const pleaseAlien = (links, sentO, args) => {
	const {isSpoiler} = JSON.parse(fs.readFileSync('./config.json'))
	if (links.length === 0) {
		return {reply:{content:"Links exhausted"}, sent: sentO}
	}
	const rand = Math.floor(Math.random()*links.length)
	const item = links[rand]
	const {played,sent} = notPlayed(item.link, sentO)
	if (!played) {
		notSpoiler = (!isSpoiler || args[0] =="*") || item.tags.every(i => {
			return args.includes(i)
		})
		const text = (notSpoiler)? item.link: Formatters.spoiler(item.link) 
		const reply = {content:text}
		sent.push([item,Date.now()])
		return {reply,sent}
	}
	else {
		links.splice(rand,1)
		return pleaseAlien(links, sent, args)
	}
}

const alienPls = (msg, args) => {
	const {links} = JSON.parse(fs.readFileSync('./data/links.json'))
	const sent = JSON.parse(fs.readFileSync('./data/sent.json'))
	const sentO = checkSent(sent)
	const resp = pleaseAlien(links, sentO, args)
	console.log(resp)
	updateSent(resp.sent)
	msg.reply(resp.reply)	
}

module.exports = {
	name: 'alienpls',
	execute: alienPls
}
