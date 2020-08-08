export default class Box {
	boxes: any[] = [];
	current: any = null;
	currentIndex: number = -1;
	enable: boolean = true;
	eventName: string = 'keydown';
	gridMap: any = {};
	previous: any = null;
    previousIndex: number = -1;
    
    constructor(){
        
    }
}
