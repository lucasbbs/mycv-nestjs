import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";


describe('AuthService', () => {
  let service: AuthService
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    const users: User[] = []
    // Create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email)
        return Promise.resolve(filteredUsers)
      }, //Promise.resolve([]),
      create: (email, password) => {
        const user = { id: Math.floor(Math.random() * 999999), email, password } as User
        users.push(user)
        return Promise.resolve(user)
      } //Promise.resolve({ id: 1, email, password } as User)
    }


    const module = await Test.createTestingModule({
      providers: [AuthService, {
        provide: UsersService,
        useValue: fakeUsersService
      }]
    }).compile();

    service = module.get(AuthService);

  })

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  })

  it('creates a new user witha salted and hashed password', async () => {
    const user = await service.signup('test@test.com', '123456')

    expect(user.password).not.toEqual('123456')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();

  })

  it('throws an error if user signs up with email that is in use', async (done) => {

    await service.signup('test@test.com', '123456')
    try {
      await service.signup('test@test.com', '123456')
    } catch (error) {
      done()

    }
  })

  it('throws an error if signin is called with an unused email', async (done) => {
    try {
      await service.signin('test@test.com', '123456');
    } catch (error) {
      done();
    }
  })

  it('throws an error if an invalid password is provided', async (done) => {
    await service.signup('test1@test.com', 'password')
    try {
      await service.signin('test1@test.com', 'wrongpassword')
    } catch (error) {
      done()
    }
  })

  it('returns a user if a correct password is provided', async () => {
    await service.signup('test@test.com', '123456')
    const user = await service.signin('test@test.com', '123456')
    expect(user).toBeDefined()
  })
})
