import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { UpdateExpiryDto } from './dto/update-expiry.dto';
import { AnnouncementsQueryDto } from './dto/query/announcements.dto';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let service: AnnouncementsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    toggleActive: jest.fn(),
    updateExpiry: jest.fn(),
    remove: jest.fn(),
  };

  const mockAnnouncement = {
    id: 'ann-1',
    title: 'Blood Drive',
    content: 'Join us!',
    is_active: true,
    expired_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        {
          provide: AnnouncementsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the dto', async () => {
      const dto: CreateAnnouncementDto = {
        title: 'Blood Drive',
        content: 'Join us!',
      };
      mockService.create.mockResolvedValue({
        message: 'Announcement created successfully',
        data: mockAnnouncement,
      });
      const result = await controller.create(dto);
      expect(result.message).toBe('Announcement created successfully');
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated announcements', async () => {
      const query = new AnnouncementsQueryDto();
      mockService.findAll.mockResolvedValue({
        message: 'Announcements fetched successfully',
        data: { data: [mockAnnouncement], meta: {} },
      });
      const result = await controller.findAll(query);
      expect(result.message).toBe('Announcements fetched successfully');
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single announcement', async () => {
      mockService.findOne.mockResolvedValue({
        message: 'Announcement fetched successfully',
        data: mockAnnouncement,
      });
      const result = await controller.findOne('ann-1');
      expect(result.data).toEqual(mockAnnouncement);
      expect(service.findOne).toHaveBeenCalledWith('ann-1');
    });
  });

  describe('toggleActive', () => {
    it('should call service.toggleActive', async () => {
      mockService.toggleActive.mockResolvedValue({
        message: 'Announcement deactivated successfully',
        data: { ...mockAnnouncement, is_active: false },
      });
      const result = await controller.toggleActive('ann-1');
      expect(result.message).toBe('Announcement deactivated successfully');
      expect(service.toggleActive).toHaveBeenCalledWith('ann-1');
    });
  });

  describe('updateExpiry', () => {
    it('should call service.updateExpiry with dto', async () => {
      const dto: UpdateExpiryDto = { expired_at: '2027-01-01T00:00:00Z' };
      mockService.updateExpiry.mockResolvedValue({
        message: 'Announcement expiry updated successfully',
        data: { ...mockAnnouncement, expired_at: new Date('2027-01-01') },
      });
      const result = await controller.updateExpiry('ann-1', dto);
      expect(result.message).toBe('Announcement expiry updated successfully');
      expect(service.updateExpiry).toHaveBeenCalledWith('ann-1', dto);
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const dto: UpdateAnnouncementDto = { title: 'Updated Title' };
      mockService.update.mockResolvedValue({
        message: 'Announcement updated successfully',
        data: { ...mockAnnouncement, title: 'Updated Title' },
      });
      const result = await controller.update('ann-1', dto);
      expect(result.message).toBe('Announcement updated successfully');
      expect(service.update).toHaveBeenCalledWith('ann-1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockService.remove.mockResolvedValue({
        message: 'Announcement deleted successfully',
        data: null,
      });
      const result = await controller.remove('ann-1');
      expect(result.message).toBe('Announcement deleted successfully');
      expect(service.remove).toHaveBeenCalledWith('ann-1');
    });
  });
});
