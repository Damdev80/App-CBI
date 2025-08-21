import * as bcrypt from 'bcrypt'

export const encryp = async (password: string, salt = 10) => {
    return await bcrypt.hash(password, salt)
}

export const compare = async (password: string, hashedPassword:string) => {
    return await bcrypt.compare(password, hashedPassword)
}