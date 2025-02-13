export class Person implements PersonI {
    public id: string;
    public firstName: string | undefined;
    public lastName: string | undefined;
    public secondName: string | undefined;
    public birthDate: string | undefined;
    public deathDate: string | undefined;
    
    constructor(person: PersonI){
        this.id = person.id;
        this.firstName = person.firstName;
        this.lastName = person.lastName;
        this.secondName = person.secondName;
        this.birthDate = person.birthDate;
        this.deathDate = person.deathDate;
    }
}

export interface PersonI {
    id: string;
    firstName?: string;
    lastName?: string;
    secondName?: string;
    birthDate?: string;
    deathDate?: string;
}