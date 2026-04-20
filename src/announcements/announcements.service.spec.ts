import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsRepository } from './announcements.repository';
import { NotFoundException } from '@nestjs/common';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let repo: AnnouncementsRepository;

  const mockRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdRaw: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
      providers: [
        AnnouncementsService,
        { provide: AnnouncementsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    repo = module.get<AnnouncementsRepository>(AnnouncementsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- create ---
  describe('create', () => {
    it('should create an announcement without expiry', async () => {
      mockRepo.create.mockResolvedValue(mockAnnouncement);

      const result = await service.create({
        title: 'Blood Drive',
        content: 'Join us!',
      });

      expect(result.message).toBe('Announcement created successfully');
      expect(result.data).toEqual(mockAnnouncement);
      expect(repo.create).toHaveBeenCalledWith({
        title: 'Blood Drive',
        content: 'Join us!',
      });
    });

    it('should create an announcement with expiry date', async () => {
      const expired_at = '2027-01-01T00:00:00Z';
      mockRepo.create.mockResolvedValue({
        ...mockAnnouncement,
        expired_at: new Date(expired_at),
      });

      const result = await service.create({
        title: 'Blood Drive',
        content: 'Join us!',
        expired_at,
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ expired_at: new Date(expired_at) }),
      );
      expect(result.data.expired_at).toEqual(new Date(expired_at));
    });
  });

  // --- findAll ---
  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockRepo.findMany.mockResolvedValue([mockAnnouncement]);
      mockRepo.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.message).toBe('Announcements fetched successfully');
      expect(result.data.data).toHaveLength(1);
      expect(result.data.meta.total).toBe(1);
    });

    it('should pass is_active filter to repo', async () => {
      mockRepo.findMany.mockResolvedValue([]);
      mockRepo.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10, is_active: true });

      expect(repo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: true }),
        0,
        10,
      );
    });

    it('should pass search filter to repo as OR condition', async () => {
      mockRepo.findMany.mockResolvedValue([]);
      mockRepo.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10, search: 'blood' });

      expect(repo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          OR: [
            { title: { contains: 'blood', mode: 'insensitive' } },
            { content: { contains: 'blood', mode: 'insensitive' } },
          ],
        }),
        0,
        10,
      );
    });
  });

  // --- findOne ---
  describe('findOne', () => {
    it('should return an announcement by id', async () => {
      mockRepo.findById.mockResolvedValue(mockAnnouncement);

      const result = await service.findOne('ann-1');

      expect(result.message).toBe('Announcement fetched successfully');
      expect(result.data).toEqual(mockAnnouncement);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- update ---
  describe('update', () => {
    it('should update an announcement', async () => {
      mockRepo.findByIdRaw.mockResolvedValue(mockAnnouncement);
      mockRepo.update.mockResolvedValue({
        ...mockAnnouncement,
        title: 'New Title',
      });

      const result = await service.update('ann-1', { title: 'New Title' });

      expect(result.message).toBe('Announcement updated successfully');
      expect(result.data.title).toBe('New Title');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findByIdRaw.mockResolvedValue(null);

      await expect(service.update('missing', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- toggleActive ---
  describe('toggleActive', () => {
    it('should flip is_active from true to false', async () => {
      mockRepo.findByIdRaw.mockResolvedValue(mockAnnouncement); // is_active: true
      mockRepo.update.mockResolvedValue({
        ...mockAnnouncement,
        is_active: false,
      });

      const result = await service.toggleActive('ann-1');

      expect(result.message).toBe('Announcement deactivated successfully');
      expect(repo.update).toHaveBeenCalledWith('ann-1', { is_active: false });
    });

    it('should flip is_active from false to true', async () => {
      mockRepo.findByIdRaw.mockResolvedValue({
        ...mockAnnouncement,
        is_active: false,
      });
      mockRepo.update.mockResolvedValue({
        ...mockAnnouncement,
        is_active: true,
      });

      const result = await service.toggleActive('ann-1');

      expect(result.message).toBe('Announcement activated successfully');
      expect(repo.update).toHaveBeenCalledWith('ann-1', { is_active: true });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findByIdRaw.mockResolvedValue(null);

      await expect(service.toggleActive('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- updateExpiry ---
  describe('updateExpiry', () => {
    it('should update the expiry date', async () => {
      const expired_at = '2027-06-01T00:00:00Z';
      mockRepo.findByIdRaw.mockResolvedValue(mockAnnouncement);
      mockRepo.update.mockResolvedValue({
        ...mockAnnouncement,
        expired_at: new Date(expired_at),
      });

      const result = await service.updateExpiry('ann-1', { expired_at });

      expect(result.message).toBe('Announcement expiry updated successfully');
      expect(repo.update).toHaveBeenCalledWith('ann-1', {
        expired_at: new Date(expired_at),
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findByIdRaw.mockResolvedValue(null);

      await expect(
        service.updateExpiry('missing', { expired_at: '2027-01-01T00:00:00Z' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- remove ---
  describe('remove', () => {
    it('should delete the announcement', async () => {
      mockRepo.findByIdRaw.mockResolvedValue(mockAnnouncement);
      mockRepo.delete.mockResolvedValue(mockAnnouncement);

      const result = await service.remove('ann-1');

      expect(result.message).toBe('Announcement deleted successfully');
      expect(result.data).toBeNull();
      expect(repo.delete).toHaveBeenCalledWith('ann-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findByIdRaw.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
