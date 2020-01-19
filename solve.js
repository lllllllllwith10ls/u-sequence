class USequence {
	constructor(str) {
		str = str.split("[");
		str[1] = str[1].substr(0,str[1].length-1);
		this.base = parseInt(str[1]);
		str = str[0];
		str = str.substr(1,str.length-1);
		let array = str.split(",");
		for(let i = 0; i < array.length; i++) {
			array[i] = parseInt(array[i]);
		}
		this.sequence = array;
	}
	
	static offsetSequence(seq, offsetSeq) {
		if(offsetSeq === undefined) {
			offsetSeq = new Array(seq.length).fill(1);
		}
		let result = [];
		for(let i = 0; i < seq.length; i++) {
			if(seq[i] === 1) {
				result.push(i+1);
			} else {
				for(let j = i - offsetSeq[i]; j >= 0; j--) {
					if(seq[j] < seq[i]) {
						result.push(i-j);
						break;
					}
				}
			}
		}
		return result;
	}
	static diffSequence(seq, offsetSeq) {
		if(offsetSeq === undefined) {
			offsetSeq = new Array(seq.length).fill(1);
		}
		let result = [];
		for(let i = 0; i < seq.length; i++) {
			if(seq[i] === 1) {
				result.push(1);
			} else {
				for(let j = i - offsetSeq[i]; j >= 0; j--) {
					if(seq[j] < seq[i]) {
						result.push(seq[i]-seq[j]);
						break;
					}
				}
			}
		}
		return result;
	}
	static newOffsetSequences(seqs, aSeqs, badRoot, base) {
		for(let i = 0; i < seqs.length; i++) {
			let badPart = seqs[i].slice(badRoot);
			badPart.shift();
			let addedPart = [];
			for(let j = 0; j < base; j++) {
				let newPart = [];
				for(let k = 0; k < badPart.length; k++) {
					if(aSeqs[i][k] === 0) {
						newPart.push(badPart[k]);
					} else {
						let len = badPart.length;
						newPart.push(badPart[k]+len*(j+1));
					}
				}
				addedPart = addedPart.concat(newPart);
			}
			seqs[i] = seqs[i].concat(addedPart);
			seqs[i].pop();
		}
		return seqs;
	}
	toString() {
		let str = "(";
		for(let i = 0; i < this.sequence.length; i++) {
			if(i < this.sequence.length-1) {
				str = str + this.sequence[i] + ",";
			} else {
				str = str + this.sequence[i] + ")";
			}
		}
		str = str + "[" + this.base + "]";
		return str;
	}
	solve() {
		if(this.sequence[this.sequence.length-1] === 1) {
			this.sequence.pop();
			return this;
		}
		let diffSeqs = [];
		let offsetSeqs = [];
		while(true) {
			if(offsetSeqs.length === 0) {
				diffSeqs.push(USequence.diffSequence(this.sequence));
				offsetSeqs.push(USequence.offsetSequence(this.sequence));
			} else {
				diffSeqs.push(USequence.diffSequence(diffSeqs[diffSeqs.length-1],offsetSeqs[offsetSeqs.length-1]));
				offsetSeqs.push(USequence.offsetSequence(diffSeqs[diffSeqs.length-2],offsetSeqs[offsetSeqs.length-1]));
			}
			if(diffSeqs[diffSeqs.length-1][diffSeqs[diffSeqs.length-1].length-1] === 1) {
				break;
			}
		}
		if(diffSeqs.length === 1) {
			let num = this.sequence[this.sequence.length-1];
			let badRoot = 0;
			for(let i = this.sequence.length-2; i >= 0; i--) {
				if(this.sequence[i] < num) {
					badRoot = i;
					break;
				}
			}
			let badPart = this.sequence.slice(badRoot);
			badPart.pop();
			let addedPart = [];
			for(let i = 0; i < this.base; i++) {
				addedPart = addedPart.concat(badPart);
			}
			this.sequence.pop();
			this.sequence = this.sequence.concat(addedPart);
			return this;
		} else {
			let diff = diffSeqs[diffSeqs.length-2];
			let num = diff[diff.length-1];
			let offset = offsetSeqs[offsetSeqs.length-2][offsetSeqs[offsetSeqs.length-2].length-1];
			let badRoot = 0;
			for(let i = diff.length-offset; i >= 0; i--) {
				if(diff[i] < num) {
					badRoot = i;
					break;
				}
			}
			let badPart = diff.slice(badRoot);
			badPart.pop();
			let len = badPart.length;
			let ascensionSeqs = [];
			for(let i = 0; i < offsetSeqs.length; i++) {
				let aSeq = [];
				for(let j = badRoot+1; j < offsetSeqs[i].length; j++) {
					if(offsetSeqs[i][j] > i + badRoot + 2) {
						aSeq.push(1);
					} else {
						aSeq.push(0);
					}
				}
				ascensionSeqs.push(aSeq);
			}
			offsetSeqs = USequence.newOffsetSequences(offsetSeqs,ascensionSeqs,badRoot,this.base);
			let addedPart = [];
			for(let i = 0; i < this.base; i++) {
				addedPart = addedPart.concat(badPart);
			}
			diff.pop();
			diff = diff.concat(addedPart);
			diffSeqs[diffSeqs.length-2] = diff;
			this.reform(diffSeqs, offsetSeqs);
			return this;
		}
	}
	reform(diff, offset) {
		for(let i = diff.length-3; i >= 0; i--) {
			diff[i] = new Array(diff[diff.length-2].length);
			for(let j = 0; j < diff[i].length; j++) {
				if(offset[i+1][j] > j) {
					diff[i][j] = 1;
				} else {
					diff[i][j] = diff[i][j-offset[i+1][j]] + diff[i+1][j]
				}
			}
		}
		this.sequence = new Array(diff[diff.length-2].length);
		for(let i = 0; i < this.sequence.length; i++) {
			if(offset[0][i] > i) {
				this.sequence[i] = 1;
			} else {
				this.sequence[i] = this.sequence[i-offset[0][i]] + diff[0][i]
			}
		}
	}
}

function solve() {
	let seq = document.getElementById("input").value;
	seq = new USequence(seq);
	seq = seq.solve();
	document.getElementById("input").value = seq.toString();

}
