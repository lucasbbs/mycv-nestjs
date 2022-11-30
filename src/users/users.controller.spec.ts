import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service'
import { User } from './user.entity'
import { AuthService } from './auth.service';


describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number): Promise<User> => {
        return Promise.resolve({ id, email: 'test@test.com', password: '123456' } as User)
      },
      find: (email: string): Promise<User[]> => {
        return Promise.resolve([{ id: Math.floor(Math.random() * 9999), email, password: '123456' } as User])
      },
      // remove: (id: number) => { },
      // update: () => { }
    }
    fakeAuthService = {
      signin: (email: string, password: string): Promise<User> => {
        return Promise.resolve({ id: 1, email, password } as User)
      },
      // signup: (email: string, password: string): Promise<User> => { return }
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        }, {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@test.com')
    expect(users.length).toEqual(1)
    expect(users[0].email).toEqual('test@test.com')
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1')
    expect(user).toBeDefined()

  });

  it('findUser throws an error if user with given id is not found', async (done) => {
    fakeUsersService.findOne = () => null
    try {
      await controller.findUser('1')
    } catch (error) {
      done()
    }
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 }
    const user = await controller.signin(
      { email: 'test@test.com', password: '123456' },
      session
    )
    expect(user.id).toEqual(1)
    expect(session.userId).toEqual(1)
  })
});
