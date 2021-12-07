using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public MessageRepository(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message); //AddAsync
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .SingleOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = _context.Messages.OrderByDescending(m => m.DateSent).AsQueryable();

            messages = messageParams.Container switch
            {
                "Inbox" => messages.Where(m => m.Recipient.UserName == messageParams.Username
                    && m.RecipientDeleted == false),
                "Outbox" => messages.Where(m => m.Sender.UserName == messageParams.Username
                    && m.SenderDeleted == false),
                _ => messages.Where(m => m.Recipient.UserName == messageParams.Username
                    && m.DateRead == null && m.RecipientDeleted == false)
            };

            var messagesDto = messages.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

            return await PagedList<MessageDto>.CreateAsync(messagesDto, 
                messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, 
            string recipientUsername)
        {
            var messages = await _context.Messages
                .Include(m => m.Sender).ThenInclude(u => u.Photos)
                .Include(m => m.Recipient).ThenInclude(u => u.Photos)
                .Where(m => m.Sender.UserName == currentUsername
                    && m.Recipient.UserName == recipientUsername 
                    && m.SenderDeleted == false
                    || m.Sender.UserName == recipientUsername 
                    && m.Recipient.UserName == currentUsername
                    && m.RecipientDeleted == false)
                .OrderBy(m => m.DateSent)
                .ToListAsync();

            var unreadMessages = messages.Where(m => m.DateRead == null
                && m.Recipient.UserName == currentUsername).ToList();
            
            if(unreadMessages.Any())
            {
                unreadMessages.ForEach(m => m.DateRead = DateTime.Now);
                await _context.SaveChangesAsync();
            }

            return _mapper.Map<IEnumerable<MessageDto>>(messages);           
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}