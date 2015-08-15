Meteor.methods({
	// "addLotteryToHomePage": function(id){
	// 	var lottery = Lotteries.findOne(id);
	// 	if ( lottery ){
	// 		Lotteries.update(lottery._id, {$set: {onHomePage: true}});
	// 		Lotteries.update({_id: {$ne: id}}, {$set: {onHomePage: false}}, {multi: true});
	// 	}
	// },
	// "setLotteryWinner": function(lid, uid){
	// 	LotteryUsers.update({_id: uid}, {$set: {winner: true}});
	// 	LotteryUsers.update({_id: {$ne: uid}, lottery_id: lid}, {$set: {winner: false}}, {multi: true});
	// }
});
